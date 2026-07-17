from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Asegúrate! PDF Service")
templates_env = Environment(loader=FileSystemLoader("templates"))


class ContractData(BaseModel):
    request_id: str
    company_name: str
    rut: str
    service_type: str
    start_date: str
    end_date: str
    total_hours: int
    amount: float
    buy_order: str
    transaction_date: str


@app.get("/health")
def health():
    return {"status": "ok", "service": "pdf-service-python"}


@app.post("/generate-pdf")
def generate_pdf(data: ContractData):
    try:
        template = templates_env.get_template("contrato.html")
        html_content = template.render(**data.model_dump())
        pdf_bytes = HTML(string=html_content).write_pdf()
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="contrato-{data.request_id[:8]}.pdf"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar PDF: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
