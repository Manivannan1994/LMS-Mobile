import React from "react";
import '../../styles/_accordion.scss';
import { ChevronRight, ChevronDown } from "react-feather";

/**
 *
 * @param { title, content, key, index, openIndex, toggle } param
 * @returns
 */
const Accordion = ({ title, content, key, index, openIndex, toggle }) => {
  return (
    <div className="mt-3">
      <div key={key} className="accordion-item border-bottom">
        <div className="accordion-header" onClick={() => toggle(index)}>
          <div className="d-flex accordian-title-height">
            <span>
              {openIndex.includes(index) ? (
                <ChevronDown className="svg-icon_small" />
              ) : (
                <ChevronRight className="svg-icon_small" />
              )}
            </span>
            <div className="col-12">{title}</div>
          </div>
        </div>
        {openIndex.includes(index) ? (
          <div className="accordion-content bg-light border rounded mt-1">
            <div className="d-flex">
              {content}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Accordion;
