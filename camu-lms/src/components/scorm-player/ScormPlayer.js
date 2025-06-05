import React from 'react';
const ScormPlayer = ({ scormUrl }) => {
  const isPdf = scormUrl.endsWith('.pdf'); // Check if the URL is a PDF
  const formattedUrl = isPdf ? `${scormUrl}#toolbar=0` : scormUrl;
  return (
    <iframe
      src={formattedUrl}
      width="600"
      height="400"
      style={{  width: '100%', height: '100%', border: 'none'  }}
      title="SCORM Preview"
    />
  );
};

export default ScormPlayer;
