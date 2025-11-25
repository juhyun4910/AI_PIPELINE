import os
import uuid
from pathlib import Path
from pypdf import PdfReader
from docx import Document
import chardet
from config import get_settings


class DocumentService:
    """문서 처리 서비스"""

    def __init__(self):
        self.settings = get_settings()
        os.makedirs(self.settings.upload_dir, exist_ok=True)

    async def save_file(self, filename: str, content: bytes) -> str:
        """파일 저장 후 경로 반환"""
        file_id = str(uuid.uuid4())
        ext = Path(filename).suffix.lower()
        save_path = os.path.join(self.settings.upload_dir, f"{file_id}{ext}")

        with open(save_path, "wb") as f:
            f.write(content)

        return save_path

    def extract_text(self, file_path: str) -> str:
        """파일에서 텍스트 추출"""
        ext = Path(file_path).suffix.lower()

        if ext == ".pdf":
            return self._extract_pdf(file_path)
        elif ext == ".docx":
            return self._extract_docx(file_path)
        elif ext in [".txt", ".md", ".csv"]:
            return self._extract_text_file(file_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")

    def _extract_pdf(self, file_path: str) -> str:
        """PDF에서 텍스트 추출"""
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()

    def _extract_docx(self, file_path: str) -> str:
        """DOCX에서 텍스트 추출"""
        doc = Document(file_path)
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text.strip()

    def _extract_text_file(self, file_path: str) -> str:
        """텍스트 파일 읽기 (인코딩 자동 감지)"""
        with open(file_path, "rb") as f:
            raw = f.read()

        detected = chardet.detect(raw)
        encoding = detected["encoding"] or "utf-8"

        return raw.decode(encoding).strip()

    def chunk_text(
        self,
        text: str,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
    ) -> list[str]:
        """텍스트를 청크로 분할"""
        if not text:
            return []

        chunks = []
        start = 0

        while start < len(text):
            end = start + chunk_size

            # 문장 끝에서 자르기 시도
            if end < len(text):
                # 마침표, 물음표, 느낌표, 개행 찾기
                for sep in [". ", "? ", "! ", "\n"]:
                    last_sep = text[start:end].rfind(sep)
                    if last_sep != -1:
                        end = start + last_sep + len(sep)
                        break

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            start = end - chunk_overlap

        return chunks


def get_document_service() -> DocumentService:
    return DocumentService()
