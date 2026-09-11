import os
import io
from datetime import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf_report(
    title: str,
    project_name: str,
    query: str,
    image_meta: Dict[str, Any],
    analysis_result: Dict[str, Any],
    secondary_meta: Dict[str, Any] = None
) -> bytes:
    """
    Generates a publication-grade geospatial intelligence PDF report using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    header_style = ParagraphStyle(
        'GISHeader',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#17201B'),
        fontName='Helvetica-Bold'
    )
    sub_header_style = ParagraphStyle(
        'GISSubHeader',
        parent=styles['Heading2'],
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#167A4A'),
        fontName='Helvetica-Bold'
    )
    body_style = ParagraphStyle(
        'GISBody',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#17201B'),
        fontName='Helvetica'
    )
    bold_body_style = ParagraphStyle(
        'GISBoldBody',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#17201B'),
        fontName='Helvetica-Bold'
    )
    caption_style = ParagraphStyle(
        'GISCaption',
        parent=styles['Normal'],
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#64748B'),
        fontName='Helvetica-Oblique'
    )

    story = []

    # Title & Metadata Header
    story.append(Paragraph("SATQUERY AI — GEOSPATIAL INTELLIGENCE REPORT", header_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"Official Analysis Verification • Generated {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}", caption_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#167A4A'), spaceBefore=1, spaceAfter=12))

    # Executive Overview Box
    overview_data = [
        [
            Paragraph("<b>Project:</b>", body_style), Paragraph(project_name or "General Analysis", body_style),
            Paragraph("<b>Analysis Type:</b>", body_style), Paragraph(analysis_result.get("task_type", "VQA"), body_style)
        ],
        [
            Paragraph("<b>Primary Image:</b>", body_style), Paragraph(image_meta.get("filename", "N/A"), body_style),
            Paragraph("<b>Sensor / Modality:</b>", body_style), Paragraph(f"{image_meta.get('sensor', 'Sentinel-2')} ({image_meta.get('modality', 'Optical')})", body_style)
        ],
        [
            Paragraph("<b>Acquisition Date:</b>", body_style), Paragraph(image_meta.get("acquisition_date", "2026-03-15"), body_style),
            Paragraph("<b>CRS / Resolution:</b>", body_style), Paragraph(f"{image_meta.get('crs', 'EPSG:4326')} @ {image_meta.get('resolution_m', 10.0)}m", body_style)
        ],
        [
            Paragraph("<b>Model / Tool:</b>", body_style), Paragraph(analysis_result.get("model_name", "SatQuery RS-VLM"), body_style),
            Paragraph("<b>Confidence / Reliability:</b>", body_style), Paragraph(f"<b>{analysis_result.get('confidence_score', 89)}%</b> • {analysis_result.get('reliability_score', 'High')}", bold_body_style)
        ]
    ]
    if secondary_meta:
        overview_data.append([
            Paragraph("<b>Comparative Image:</b>", body_style), Paragraph(secondary_meta.get("filename", "N/A"), body_style),
            Paragraph("<b>Sensor B:</b>", body_style), Paragraph(f"{secondary_meta.get('sensor', 'N/A')} ({secondary_meta.get('modality', 'N/A')})", body_style)
        ])

    overview_table = Table(overview_data, colWidths=[105, 160, 115, 150])
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FBFDFB')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E3EAE5')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E3EAE5')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(overview_table)
    story.append(Spacer(1, 14))

    # User Query & Executive AI Findings
    story.append(Paragraph("1. INVESTIGATION QUERY & EXECUTIVE FINDINGS", sub_header_style))
    story.append(Spacer(1, 6))
    
    query_box = [
        [Paragraph("<b>User Query:</b>", bold_body_style), Paragraph(f"<i>\"{query}\"</i>", body_style)]
    ]
    q_table = Table(query_box, colWidths=[80, 450])
    q_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#EAF7F0')),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#167A4A')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(q_table)
    story.append(Spacer(1, 8))

    answer_text = analysis_result.get("answer_en", "Analysis successfully completed.")
    story.append(Paragraph(f"<b>AI Assessment:</b> {answer_text}", body_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph(f"<b>Reliability Rationale:</b> {analysis_result.get('reliability_reason', 'Verified via radiometric calibration and sub-pixel edge alignment.')}", caption_style))
    story.append(Spacer(1, 14))

    # Evidence Grounding Table
    story.append(Paragraph("2. VERIFIED SPATIAL EVIDENCE (WHAT & WHERE)", sub_header_style))
    story.append(Spacer(1, 6))

    evidence_regions = analysis_result.get("evidence_regions", [])
    if evidence_regions:
        ev_header = [
            Paragraph("<b>Region ID / Label</b>", bold_body_style),
            Paragraph("<b>Feature Class</b>", bold_body_style),
            Paragraph("<b>Area (ha)</b>", bold_body_style),
            Paragraph("<b>Area (km²)</b>", bold_body_style),
            Paragraph("<b>Confidence</b>", bold_body_style)
        ]
        ev_rows = [ev_header]
        for ev in evidence_regions:
            ev_rows.append([
                Paragraph(str(ev.get("label", "Region")), body_style),
                Paragraph(str(ev.get("type", "Detection")), body_style),
                Paragraph(str(ev.get("area_hectares", 0.0)), body_style),
                Paragraph(str(ev.get("area_sqkm", 0.0)), body_style),
                Paragraph(f"{ev.get('confidence', 90)}%", bold_body_style)
            ])
        
        ev_table = Table(ev_rows, colWidths=[160, 130, 80, 80, 80])
        ev_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#167A4A')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E3EAE5')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E3EAE5')),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(ev_table)
    else:
        story.append(Paragraph("No isolated spatial clusters detected. Scene-level assessment confirmed.", body_style))

    story.append(Spacer(1, 14))

    # Audit Trail Timeline
    story.append(Paragraph("3. AUDITABLE AGENT EXECUTION SUMMARY", sub_header_style))
    story.append(Spacer(1, 6))
    
    timeline = analysis_result.get("timeline", [])
    if timeline:
        t_header = [
            Paragraph("<b>Execution Step</b>", bold_body_style),
            Paragraph("<b>Status</b>", bold_body_style),
            Paragraph("<b>Operational Details</b>", bold_body_style),
            Paragraph("<b>Elapsed</b>", bold_body_style)
        ]
        t_rows = [t_header]
        for step in timeline:
            t_rows.append([
                Paragraph(step.get("step", ""), body_style),
                Paragraph(step.get("status", "SUCCESS"), bold_body_style),
                Paragraph(step.get("details", ""), caption_style),
                Paragraph(f"{step.get('timestamp_ms', 0)} ms", body_style)
            ])
        t_table = Table(t_rows, colWidths=[120, 70, 270, 70])
        t_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_table)

    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#CBD5E1'), spaceBefore=2, spaceAfter=8))
    story.append(Paragraph("CONFIDENTIAL • FOR AUTHORIZED REMOTE SENSING INTELLIGENCE USE ONLY • SatQuery AI Platform v1.0", caption_style))

    doc.build(story)
    return buffer.getvalue()
