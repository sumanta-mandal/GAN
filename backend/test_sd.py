from diffusers import StableDiffusionPipeline
import torch

# Use MPS (Apple Silicon) if available, otherwise fallback to CPU
device = "mps" if torch.backends.mps.is_available() else "cpu"

print(f"Using device: {device}")

# Load the model
pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5", torch_dtype=torch.float32).to(device)

# Run inference
prompt = "a futuristic cyberpunk city at night"
image = pipe(prompt, guidance_scale=7.5, num_inference_steps=10).images[0]

# Save the image
image.save("test_ouput.png")
print("Image generated successfully.")
