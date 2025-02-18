import React from 'react';
import { AbsoluteFill, Audio } from 'remotion';

const CodeReviewVideo = ({ audioPath, summary }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1 style={{ color: 'white', fontSize: 50, textAlign: 'center' }}>
        {summary}
      </h1>
      <Audio src={audioPath} />
    </AbsoluteFill>
  );
};

export default CodeReviewVideo;
