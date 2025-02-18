import React, { useState, useRef } from "react";

const App = () => {
  const [summary, setSummary] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const codeDiffInput = useRef();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const codeDiff = codeDiffInput.current.value; // Get the code diff

    try {
      const response = await fetch("http://localhost:5000/generate-summary-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ codeDiff }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary and speech");
      }

      const data = await response.json();
      const { summary, audioUrl } = data;

      // Now handle the summary and audio file URL
      setSummary(summary); // Display the summary
      setAudioUrl(audioUrl); // Set the audio file URL to play the audio

    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>AI Code Review</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          ref={codeDiffInput}
          placeholder="Paste the code diff here"
          style={{ width: "300px", height: "150px" }}
        ></textarea>
        <br />
        <button type="submit">Generate Summary and Speech</button>
      </form>

      {summary && (
        <div>
          <h2>Summary of Changes</h2>
          <p>{summary}</p>
        </div>
      )}

      {audioUrl && (
        <div>
          <h2>Audio:</h2>
          <audio controls>
            <source src={`http://localhost:5000${audioUrl}`} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default App;
