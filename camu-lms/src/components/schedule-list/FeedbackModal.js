import React, { Component, lazy } from 'react';
// import messageUtil from '../../utils/message-util';
// import HTTPService from "../../utils/http-util";
import { withTranslation } from 'react-i18next';
import TextArea from '../text-area/TextArea';
import Rating from './Rating';

const LmsModal = lazy(() => import("../modal/LmsModal"));

class FeedbackModal extends Component {
  constructor(props) {
    super(props);
    this.textAreaRefs = {};
    this.state = {
      fbNm : props.oFeedbackDtls?.Nm,
      fbAttTyp : props?.oFeedbackDtls?.atrTyp,
      feedbackAttr : props.oFeedbackDtls?.FdbkAttr || []
      }
    };

  handleCommentChange = (rowIndex, value) => {
    this.setState((prevState) => {
      const updatedFeedbackValues = [...prevState.feedbackAttr]; // Make a copy
  
      if (updatedFeedbackValues?.[rowIndex]) {
        updatedFeedbackValues[rowIndex].Cmnts = value;
      }
  
      return { feedbackAttr: updatedFeedbackValues };
    });
  };
  
  handleRatingChange = (rowIndex, value) => {
    this.setState((prevState) => {
      const updatedFeedbackValues = [...prevState.feedbackAttr]; // Copy to avoid mutation
  
      if (updatedFeedbackValues?.[rowIndex]) {
        updatedFeedbackValues[rowIndex].Rtng = value;
      }
  
      return { feedbackAttr: updatedFeedbackValues };
    });
  };
  

  aFeedbackHeader = () => [
    {
      id: 'attribute',
      accessor: 'Attr',
      size: '10%',
      sortType: "basic",
      Header: this.props.t("translate:ATTRIBUTE"),
      cell: ({ row }) => <div>{row.original.Attr}</div>
    },
    ...(this.state?.fbAttTyp === 'Star rating'
      ? [
          {
            id: 'ratings',
            accessor: 'Rtng',
            Header: this.props.t("translate:RATING"),
            Cell: ({ row }) => {
              return (
                <Rating
                rating={row.original.Rtng}
                initialValue={row.original.Rtng}
                iconsCount={this.props?.oFeedbackDtls?.StrRate || 5}
                allowHover={true}
                showTooltip={true}
                tooltipArray={row.original.newRmkArr}
                onClick={(e) => {
                  this.handleRatingChange(row?.index, e);
                }}
              />
              );
            }
          }
        ]
      : []),
    {
      id: "comments",
      Header: this.props.t("translate:COMMENTS"),
      accessor: "Cmnts",
      size: "8%",
      Cell: ({ row }) => {
        return (
          <div data-row-index={row.index} className="textarea-container">
            <TextArea
              field="textarea"
              fieldName="Cmnts"
              defaultValue={row.original.Cmnts}
              value={row.original.Cmnts}
              rows={3}
              onChange={(e) => { 
                // Store current cursor position
                const target = e.target;
                const selectionStart = target.selectionStart;
                const selectionEnd = target.selectionEnd;
                const rowIndex = row.index;
                
                // Handle the comment change
                this.handleCommentChange(rowIndex, target.value);
                
                // Restore cursor position after re-render
                setTimeout(() => {
                  // Find the textarea
                  const container = document.querySelector(`.textarea-container[data-row-index="${rowIndex}"]`);
                  if (container) {
                    const textarea = container.querySelector('textarea');
                    if (textarea) {
                      textarea.focus();
                      // Restore cursor position
                      textarea.setSelectionRange(selectionStart, selectionEnd);
                    }
                  }
                }, 0);
              }}
            />
          </div>
        );
      }
    },

  ];

  render() {
    const { t, onClose,  } = this.props;
    const { feedbackAttr, fbNm, fbAttTyp } = this.state;

    return (
      <>
        {this.props.isOpen && (
          <LmsModal
            open={this.props.isOpen}
            onClose={onClose}
            className="modal-lg"
            feedbackColumns={this.aFeedbackHeader()}
            feedbackData={feedbackAttr}
            modalTitle={t("translate:FEEDBACK")}
            canShowFeedbackModal={this.props.isOpen}
            onClick={() => this.props.feedbackSubmit({ 
              ...this.props?.oFeedbackDtls,
              FdbkAttr: feedbackAttr, 
              atrTyp: fbAttTyp,
              Nm: fbNm
            })}
            disabled={!this.props?.oFeedbackDtls?.FdbkAttr?.length}
            btnName='submit'
          />
        )}
      </>
    );
  }
};

export default withTranslation()(FeedbackModal);