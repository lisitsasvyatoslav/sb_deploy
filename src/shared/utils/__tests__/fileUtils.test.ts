import {
  getFileIcon,
  getFileTypeFromExtension,
} from '@/shared/utils/fileUtils';

describe('File Utils', () => {
  describe('getFileIcon', () => {
    it('should return correct icon for PDF files', () => {
      const icon = getFileIcon('pdf');
      expect(icon).toBe('📄');
    });

    it('should return correct icon for DOC files', () => {
      const icon = getFileIcon('doc');
      expect(icon).toBe('📝');
    });

    it('should return correct icon for DOCX files', () => {
      const icon = getFileIcon('docx');
      expect(icon).toBe('📝');
    });

    it('should return correct icon for XLS files', () => {
      const icon = getFileIcon('xls');
      expect(icon).toBe('📊');
    });

    it('should return correct icon for XLSX files', () => {
      const icon = getFileIcon('xlsx');
      expect(icon).toBe('📊');
    });

    it('should return correct icon for image files', () => {
      const icon = getFileIcon('jpg');
      expect(icon).toBe('🖼️');
    });

    it('should return default icon for unknown file types', () => {
      const icon = getFileIcon('unknown');
      expect(icon).toBe('📁');
    });
  });

  describe('getFileTypeFromExtension', () => {
    it('should extract file type from filename', () => {
      const type = getFileTypeFromExtension('document.pdf');
      expect(type).toBe('pdf');
    });

    it('should handle files without extension', () => {
      const type = getFileTypeFromExtension('document');
      expect(type).toBe('file');
    });

    it('should handle files with multiple dots', () => {
      const type = getFileTypeFromExtension('document.backup.pdf');
      expect(type).toBe('pdf');
    });

    it('should handle uppercase extensions', () => {
      const type = getFileTypeFromExtension('document.PDF');
      expect(type).toBe('pdf');
    });
  });
});
