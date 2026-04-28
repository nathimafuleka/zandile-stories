#!/usr/bin/env python3
"""
PDF Text Extraction with Formatting Preservation
Extracts text from PDF with bold, italic, and proper spacing preserved as HTML
"""

import sys
import json
import fitz  # PyMuPDF
import io
import re

# Set UTF-8 encoding for stdout to handle emojis and special characters on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def extract_pdf_with_formatting(pdf_path, skip_first_page=True):
    """
    Extract text from PDF with formatting preserved
    
    Args:
        pdf_path: Path to PDF file
        skip_first_page: Whether to skip the first page (cover)
    
    Returns:
        dict: Extracted chapters with formatted HTML content
    """
    try:
        doc = fitz.open(pdf_path)
        chapters = []
        current_chapter = None
        current_content = []
        
        # Start from page 1 (index 1) if skipping first page, else 0
        start_page = 1 if skip_first_page else 0
        
        # Collect all lines with Y-position for smart paragraph detection
        all_lines = []
        
        for page_num in range(start_page, len(doc)):
            page = doc[page_num]
            blocks = page.get_text("dict")["blocks"]
            
            for block in blocks:
                if "lines" not in block:
                    continue
                
                for line in block["lines"]:
                    line_html = []
                    line_text = ""
                    y_pos = line["bbox"][1] if "bbox" in line else 0
                    
                    for span in line["spans"]:
                        text = span["text"].strip()
                        if not text:
                            continue
                        
                        font = span["font"].lower()
                        is_bold = "bold" in font or "heavy" in font or "black" in font
                        is_italic = "italic" in font or "oblique" in font
                        
                        formatted_text = text
                        if is_bold:
                            formatted_text = f"<strong>{formatted_text}</strong>"
                        if is_italic:
                            formatted_text = f"<em>{formatted_text}</em>"
                        
                        line_html.append(formatted_text)
                        line_text += text + " "
                    
                    if line_html:
                        all_lines.append({
                            "html": " ".join(line_html),
                            "text": line_text.strip(),
                            "y_pos": y_pos
                        })
        
        # First pass: identify chapter breaks and mark empty lines
        i = 0
        while i < len(all_lines):
            line_data = all_lines[i]
            line_text = line_data["text"]
            
            # Check for chapter headings
            is_chapter = False
            chapter_title = None
            
            if line_text.lower().startswith("prologue"):
                is_chapter = True
                chapter_title = "Prologue"
            elif line_text.lower().startswith("epilogue"):
                is_chapter = True
                chapter_title = "Epilogue"
            elif line_text.lower().startswith("chapter"):
                parts = line_text.split()
                if len(parts) >= 2:
                    chapter_num = parts[1].strip()
                    clean_num = re.sub(r'[^\w]', '', chapter_num)
                    if clean_num.isdigit():
                        is_chapter = True
                        chapter_title = f"Chapter {clean_num}"
            
            if is_chapter and chapter_title:
                # Save previous chapter
                if current_chapter and current_content:
                    chapters.append({
                        "title": current_chapter,
                        "content": "".join(current_content).strip()
                    })
                
                # Start new chapter
                current_chapter = chapter_title
                current_content = []
                i += 1
                continue
            
            # Process content lines for current chapter
            if current_chapter:
                # Collect lines until we hit a large Y-gap (empty line)
                paragraph_lines = []
                prev_y = line_data["y_pos"]
                prev_line_text = ""
                
                while i < len(all_lines):
                    curr_line = all_lines[i]
                    curr_text = curr_line["text"]
                    curr_y = curr_line["y_pos"]
                    curr_html = curr_line["html"]
                    
                    # Check if this is a new chapter heading
                    if (curr_text.lower().startswith("prologue") or 
                        curr_text.lower().startswith("epilogue") or 
                        curr_text.lower().startswith("chapter")):
                        break
                    
                    # Calculate Y-gap (vertical distance between lines)
                    y_gap = abs(curr_y - prev_y) if prev_y is not None else 0
                    
                    # Detect paragraph breaks:
                    # 1. Large vertical gap (> 25 units)
                    # 2. Empty or very short line (less than 3 characters)
                    # 3. Line ends with punctuation followed by capital letter on next line
                    is_empty_line = len(curr_text.strip()) < 2
                    is_large_gap = y_gap > 25
                    ends_with_punctuation = prev_line_text and prev_line_text[-1] in '.!?"\'"'
                    starts_with_capital = curr_text and curr_text[0].isupper() if curr_text else False
                    
                    # If we have paragraph content and hit a break condition, save the paragraph
                    if paragraph_lines and (is_large_gap or is_empty_line or (ends_with_punctuation and is_large_gap > 15)):
                        # Save current paragraph
                        para_html = " ".join(paragraph_lines)
                        if para_html.strip():
                            current_content.append(f'<p style="margin-bottom: 1em;">{para_html}</p>')
                        paragraph_lines = []
                    
                    # Skip empty lines but still create paragraph breaks
                    if is_empty_line:
                        if paragraph_lines:
                            para_html = " ".join(paragraph_lines)
                            if para_html.strip():
                                current_content.append(f'<p style="margin-bottom: 1em;">{para_html}</p>')
                            paragraph_lines = []
                        # Add extra spacing for empty lines (paragraph break)
                        if current_content and not current_content[-1].endswith('<br>'):
                            current_content.append('<br>')
                    else:
                        # Add line to current paragraph
                        paragraph_lines.append(curr_html)
                    
                    prev_y = curr_y
                    prev_line_text = curr_text
                    i += 1
                
                # Save any remaining paragraph
                if paragraph_lines:
                    para_html = " ".join(paragraph_lines)
                    if para_html.strip():
                        current_content.append(f'<p style="margin-bottom: 1em;">{para_html}</p>')
            else:
                i += 1
        
        if current_chapter:
            chapters.append({
                "title": current_chapter,
                "content": "".join(current_content).strip()
            })
        
        # Get page count before closing document
        total_pages = len(doc)
        processed_pages = total_pages - start_page
        
        doc.close()
        
        return {
            "success": True,
            "chapters": chapters,
            "total_pages": total_pages,
            "processed_pages": processed_pages
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No PDF path provided"}))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    skip_first = sys.argv[2].lower() == "true" if len(sys.argv) > 2 else True
    
    result = extract_pdf_with_formatting(pdf_path, skip_first)
    print(json.dumps(result, ensure_ascii=False))
