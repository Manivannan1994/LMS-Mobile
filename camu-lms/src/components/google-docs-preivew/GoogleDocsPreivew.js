import React from 'react';
import Iframe from 'react-iframe';

const GoogleDocsPreivew = (props) => {
    return (
		<div>
		    {<Iframe url={props.embedUrl}
			    width={props.width}
			    height={props.height}/>
		    }
		</div>
	);
}

export default GoogleDocsPreivew;