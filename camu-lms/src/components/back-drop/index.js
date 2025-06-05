import "./styles.css";
const BackDrop=(props)=>{
    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
          // Only call props.close when clicking on the backdrop (not on dialog content)
          props.close && props.close();
        }
      };
    
      if (props.dialog) {
        return (
          <div className="backdrop" onClick={handleBackdropClick}>
            {props.children}
          </div>
        );
      } else {
        return props.children;
      }
}
export default BackDrop