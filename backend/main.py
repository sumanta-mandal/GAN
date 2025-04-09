from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from diffusers import StableDiffusionPipeline
import torch
from io import BytesIO
from fastapi.responses import StreamingResponse
import asyncio
from concurrent.futures import ThreadPoolExecutor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = "mps" if torch.backends.mps.is_available() else "cpu"
print(f"Using device: {device}")


pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float32
).to(device)

pipe.enable_attention_slicing()

executor = ThreadPoolExecutor(max_workers=1)

class ImageRequest(BaseModel):
    prompt: str
    guidance_scale: float
    num_inference_steps: int
    height: int
    width: int

async def generate_image_async(request: ImageRequest):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, lambda: pipe(
        request.prompt, 
        guidance_scale=request.guidance_scale,
        num_inference_steps=request.num_inference_steps,
        height=request.height,
        width=request.width
    ).images[0])

@app.post("/generate/")
async def generate_image(request: ImageRequest):
    try:
        print(f"Generating image with prompt: {request.prompt}")
        image = await generate_image_async(request)

        img_io = BytesIO()
        image.save(img_io, format="PNG")
        img_io.seek(0)

        print("Image generated successfully.")
        return StreamingResponse(img_io, media_type="image/png")
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
