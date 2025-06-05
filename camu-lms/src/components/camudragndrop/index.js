import React, { useState, useRef } from "react";
import "./styles.css";

const DragNUpload = (props) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const containerElement = containerRef.current;
    if (!containerElement.contains(e.target)) {
      setIsDragging(false); // Set isDragging to false when leaving the container
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Additional code for handling the drag-over event, if needed.
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Access the container element using the ref
    const containerElement = containerRef.current;
    // Check if the dropped element is inside the container or its children
    if (containerElement.contains(e.target)) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    e.preventDefault();
    // Handle files selected via the file input
    handleFiles(e.target.files);
  };

  const checkFileType = (files) => {
    if (props.isMulti) {
    } else {
      const acceptedType = props.accept
        .split(/\s*,\s*/) // Split by commas and optional spaces
        .map((format) => format.replace(/^\./, "")); // Remove the leading dot
      return acceptedType.some(
        (format) => format === files[0].name.split(".")[1]
      );
    }
  };

  const handleFiles = (files) => {
    // Handle the selected files here
    if (files.length > 0) {
      if (props.accept) {
        if (checkFileType(files)) {
          props.onSelectFiles(files);
        }
      } else {
        props.onSelectFiles(files);
      }
    }
  };

  return (
    <div onDragOver={handleDragOver} onDrop={handleDrop}>
      <div
        ref={containerRef}
        className={`camu-file_dnd `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        key="cont-drop"
      >
        <div
          className="drag-txt"
          key="child-drop"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
         {`Drag 'n' drop some files here`}
        </div>
        <div  onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop} className="drop-or">or   
          <label
          htmlFor="camu-file"
          className="btn-rounded secondary-btn file-btn"
          onDragOver={handleDragOver}
        >
          Choose a file
        </label></div>
        <input
          type="file"
          id="camu-file"
          hidden
          accept={props.accept}
          key={Math.random(1, 40)}
          onDragOver={handleDragOver}
          onChange={handleFileInputChange}
        />
    
      </div>
      <p className="selective-file">Supported files: {props.accept}</p>
    </div>
  );
};

export default DragNUpload;
