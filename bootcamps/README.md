# SkillSwap Bootcamp Content & Materials Directory

This directory stores offline and downloadable course materials, lecture notes, assignments, and curriculum resources for all SkillSwap bootcamps.

## How it Works:
1. When an administrator creates a new Bootcamp from the Admin portal (e.g. `Full-Stack-Web-Development`), the backend will automatically generate a dedicated folder here:
   `bootcamps/{Bootcamp-Name}/`
   containing:
   - `materials/`
   - `assignments/`
   - `README.md`

2. **Dropping Materials & Files:**
   - Any PDF, slides, source code ZIP, or lecture document you place in `bootcamps/{Bootcamp-Name}/materials/` will automatically be scanned by the API and displayed in the **Course Materials & Downloads** tab for enrolled students in that bootcamp!
   - Any assignment brief, starter template, or dataset placed in `bootcamps/{Bootcamp-Name}/assignments/` will appear under the **Assignments** tab.

3. **Supported Formats:**
   - PDF, DOCX, TXT, MD, ZIP, PNG, JPG, MP4, PY, JS, TS, JSON, etc.
