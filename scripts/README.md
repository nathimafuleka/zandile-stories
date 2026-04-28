# PDF Extraction Scripts

Python scripts for extracting PDF content with formatting preservation.

## Setup

1. Install Python 3.8 or higher
2. Install dependencies:
```bash
cd scripts
pip install -r requirements.txt
```

## Usage

### Extract PDF with formatting
```bash
python extract_pdf.py "path/to/book.pdf" true
```

Arguments:
- `pdf_path`: Path to the PDF file
- `skip_first_page`: "true" to skip first page (cover), "false" to include all pages

### Output
Returns JSON with extracted chapters:
```json
{
  "success": true,
  "chapters": [
    {
      "title": "Prologue",
      "content": "<p>Formatted HTML content with <strong>bold</strong> and <em>italic</em> text...</p>"
    }
  ],
  "total_pages": 866,
  "processed_pages": 865
}
```

## Features

- ✅ Preserves bold text (`<strong>`)
- ✅ Preserves italic text (`<em>`)
- ✅ Proper paragraph spacing
- ✅ Natural text flow
- ✅ Detects chapter headings (Prologue, Chapter 1-50, Epilogue)
- ✅ Skips cover page
- ✅ Outputs clean HTML compatible with contentEditable
