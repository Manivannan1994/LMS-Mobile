import React from 'react';
import InfiniteScroll from "react-infinite-scroll-component";

const Infinite_Scroll = (props) => {

    return (
        <InfiniteScroll
          	dataLength={props.dataLength}
          	next={props.next}
          	hasMore={props.hasMore}
        >
        	{props.children}
        </InfiniteScroll>
    );
}

export default Infinite_Scroll;