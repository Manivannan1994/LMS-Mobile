import React, { Component } from 'react';
import '../../styles/_ratingStyles.scss'

/**
 * Utility function to detect touch devices
 */
function isTouchDevice() {
  return (
    (typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches) ||
    'ontouchstart' in window ||
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
  );
}

/**
 * A star rating component implemented as a class component.
 */
class Rating extends Component {
  constructor(props) {
    super(props);
    // Initialize state with props or default values
    this.state = {
      hoverIndex: 0,
      valueIndex: 0,
      // Use external rating if provided, otherwise fallback to initialValue or 0
      ratingValue: this.props.rating || this.props.initialValue || 0,
      hoverValue: null,
      // Keep track of whether the component was controlled by user
      userControlled: false
    };
  }

  componentDidMount() {
    // If initial value is provided, set it
    if (this.props.initialValue !== undefined && !this.state.userControlled) {
      this.setState({ 
        ratingValue: this.props.initialValue,
        userControlled: false 
      });
    }
  }

  componentDidUpdate(prevProps) {
    // If rating prop changes from parent, update state
    // But only if the component hasn't been controlled by user interaction
    if (prevProps.rating !== this.props.rating && 
        this.props.rating !== undefined && 
        !this.state.userControlled) {
      this.setState({ 
        ratingValue: this.props.rating 
      });
    }
    
    // If initialValue changes and component hasn't been user-controlled
    if (prevProps.initialValue !== this.props.initialValue && 
        this.props.initialValue !== undefined && 
        !this.state.userControlled) {
      this.setState({ 
        ratingValue: this.props.initialValue,
        userControlled: false 
      });
    }
  }

  /**
   * Handles when a pointer moves over the stars
   */
  handlePointerMove = (event) => {
    if (this.props.readonly) return;
    
    const { clientX, currentTarget } = event;
    const { rtl, allowFraction, iconsCount = 5 } = this.props;
    const totalIcons = allowFraction ? iconsCount * 2 : iconsCount;
    
    const { left, right, width } = currentTarget.children[0].getBoundingClientRect();
    const positionX = rtl ? right - clientX : clientX - left;
    let currentValue = totalIcons;
    const iconWidth = Math.round(width / totalIcons);

    for (let i = 0; i <= totalIcons; i = i + 1) {
      if (positionX <= iconWidth * i) {
        if (i === 0 && positionX < iconWidth) currentValue = 0;
        else currentValue = i;
        break;
      }
    }

    const index = currentValue - 1;

    if (currentValue > 0) {
      const newHoverValue = currentValue / totalIcons;
      
      this.setState({
        hoverValue: newHoverValue,
        hoverIndex: index
      });

      if (this.props.onPointerMove) {
        if (newHoverValue) this.props.onPointerMove(this.renderValue(newHoverValue), index, event);
      }
    }
  };

  /**
   * Handles when a pointer enters the component
   */
  handlePointerEnter = (event) => {
    if (this.props.onPointerEnter) this.props.onPointerEnter(event);
    if (!isTouchDevice()) return;
    this.handlePointerMove(event);
  };

  /**
   * Handles when a pointer leaves the component
   */
  handlePointerLeave = (event) => {
    if (isTouchDevice()) this.handleClick(event);
    
    this.setState({ hoverValue: null });
    
    if (this.props.onPointerLeave) this.props.onPointerLeave(event);
  };

  /**
   * Handles when a user clicks on a star
   */
  handleClick = (event) => {
    const { hoverValue, hoverIndex } = this.state;
    
    if (hoverValue) {
      this.handleMouseClick(hoverIndex, hoverValue, event);
    }
  };

  /**
   * Updates state when mouse is clicked
   */
  handleMouseClick = (index, value, event) => {
    // Mark the component as user-controlled
    this.setState({ 
      ratingValue: value,
      userControlled: true 
    });
    
    if (this.props.onClick && event) {
      // Calculate the actual rating value based on icons count
      const calculatedValue = this.renderValue(value);
      this.props.onClick(calculatedValue, index, event);
    }
  };

  /**
   * Calculates the rendered value based on icons count
   */
  renderValue = (value) => {
    return value * (this.props.iconsCount || 5);
  };

  /**
   * Creates a star element
   */
  getStarElement = (index) => {
    const { starSize = 24, showTooltip, tooltipArray = [] } = this.props;
    const valuePercentage = this.calculateValuePercentage();
    const iconsCount = this.props.iconsCount || 5;
    
    const isHalfStar = valuePercentage * iconsCount - index === 0.5;
    const isActive = index + 1 <= valuePercentage * iconsCount;

    const starElement = (
      <svg
        key={index}
        className={`c-star ${isActive ? 'active' : ''}`}
        width={starSize}
        height={starSize}
        viewBox={`0 0 ${starSize} ${starSize}`}
      >
        <use xlinkHref="#star" fill={isHalfStar ? 'url(#half)' : ''}></use>
      </svg>
    );

    if (showTooltip) {
      return (
        <div key={index} className="star-tooltip-wrapper">
          {starElement}
          {tooltipArray[index] && (
            <span className="star-tooltip">{tooltipArray[index]}</span>
          )}
        </div>
      );
    }

    return starElement;
  };

  /**
   * Calculates the current value percentage for rendering
   */
  calculateValuePercentage = () => {
    const { ratingValue, hoverValue } = this.state;
    const { 
      allowHover = true, 
      disableFillHover = false, 
      iconsCount = 5,
      initialValue,
      allowFraction
    } = this.props;

    // Use the current rating value from state
    let localRating = ratingValue;
    
    // Apply constraints
    if (localRating > iconsCount) localRating = iconsCount;
    if (!allowFraction && Math.floor(localRating) !== localRating) {
      localRating = Math.ceil(localRating);
    }
    
    // Convert to percentage
    localRating = localRating / iconsCount;

    if (allowHover) {
      if (disableFillHover) {
        return ((hoverValue && hoverValue > localRating ? hoverValue : localRating));
      }
      return (hoverValue || localRating);
    }

    return localRating;
  };

  render() {
    const {
      iconsCount = 5,
      rtl = false,
      readonly = false,
      className = 'react-simple-star-rating',
      rating
    } = this.props;

    // Create array of star elements
    const stars = Array.from({ length: iconsCount }, (_, index) =>
      this.getStarElement(index)
    );

    return (
      <div
        className="starRatingWrap"
        style={{ direction: `${rtl ? 'rtl' : 'ltr'}` }}
      >
        <div
          className={`simpleStarRating ${className}`}
          style={{
            cursor: readonly ? '' : 'pointer'
          }}
          onPointerMove={readonly ? undefined : this.handlePointerMove}
          onPointerEnter={readonly ? undefined : this.handlePointerEnter}
          onPointerLeave={readonly ? undefined : this.handlePointerLeave}
          onClick={readonly ? undefined : this.handleClick}
          aria-hidden="true"
        >
          <div>
            <svg
              style={{ width: 0, height: 0 }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
            >
              <defs>
                <linearGradient id="half" x1="0" x2="100%" y1="0" y2="0">
                  <stop offset="50%" stopColor="#fed94b"></stop>
                  <stop offset="50%" stopColor="#f7f0c3"></stop>
                </linearGradient>

                <symbol
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 32 32"
                  id="star"
                >
                  <path d="M31.547 12a.848.848 0 00-.677-.577l-9.427-1.376-4.224-8.532a.847.847 0 00-1.516 0l-4.218 8.534-9.427 1.355a.847.847 0 00-.467 1.467l6.823 6.664-1.612 9.375a.847.847 0 001.23.893l8.428-4.434 8.432 4.432a.847.847 0 001.229-.894l-1.615-9.373 6.822-6.665a.845.845 0 00.214-.869z" />
                </symbol>
              </defs>
            </svg>
          </div>
          <div
            className="star-rating"
            aria-label={`${rating || this.state.ratingValue} stars out of ${iconsCount}`}
          >
            {stars}
          </div>
        </div>
      </div>
    );
  }
}

export default Rating;