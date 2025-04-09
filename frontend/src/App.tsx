import React, { useState } from "react";
import axios from "axios";

const App: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [numInferenceSteps, setNumInferenceSteps] = useState(10);
  const [height, setHeight] = useState(768);
  const [width, setWidth] = useState(768);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Ensure height and width are divisible by 8
  const adjustToMultipleOf8 = (value: number) => Math.round(value / 8) * 8;

  const generateImage = async () => {
    setLoading(true);
    setProgress(0);

    const adjustedHeight = adjustToMultipleOf8(height);
    const adjustedWidth = adjustToMultipleOf8(width);

    try {
      const response = await axios.post(
        "http://localhost:8000/generate/",
        {
          prompt,
          guidance_scale: guidanceScale,
          num_inference_steps: numInferenceSteps,
          height: adjustedHeight,
          width: adjustedWidth,
        },
        {
          responseType: "blob",
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percentCompleted);
            }
          },
        }
      );

      const imageUrl = URL.createObjectURL(response.data);
      setImage(imageUrl);
    } catch (error) {
      console.error("Error generating image", error);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>AI Image Generator</h1>
      <div style={styles.form}>
        <input
          type="text"
          placeholder="Enter prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Guidance Scale"
          value={guidanceScale}
          onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Inference Steps"
          value={numInferenceSteps}
          onChange={(e) => setNumInferenceSteps(parseInt(e.target.value))}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Height"
          value={height}
          onChange={(e) => setHeight(parseInt(e.target.value))}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Width"
          value={width}
          onChange={(e) => setWidth(parseInt(e.target.value))}
          style={styles.input}
        />
        <button onClick={generateImage} disabled={loading} style={styles.button}>
          {loading ? `Generating... ${progress}%` : "Generate Image"}
        </button>
      </div>

      {loading && (
        <div style={styles.progressContainer}>
          <div style={{ ...styles.progressBar, width: `${progress}%` }}></div>
        </div>
      )}

      {image && <img src={image} alt="Generated" style={styles.image} />}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "#282c34",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    maxWidth: "400px",
    margin: "auto",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "10px 15px",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#61dafb",
    color: "#000",
    cursor: "pointer",
    transition: "0.3s",
  },
  progressContainer: {
    width: "80%",
    maxWidth: "400px",
    height: "10px",
    backgroundColor: "#555",
    borderRadius: "5px",
    overflow: "hidden",
    margin: "20px auto",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#61dafb",
    transition: "width 0.3s",
  },
  image: {
    marginTop: "20px",
    width: "300px",
    borderRadius: "10px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  },
};

export default App;
