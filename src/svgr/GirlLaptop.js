import React from 'react';
import PropTypes from 'prop-types';

const GirlLaptop = ({ size, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 33}
    height={size || 32}
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeOpacity={0.88}
      d="m23.942 17.584.89.225a3.03 3.03 0 0 1 2.141 2.005l1.468 4.533c.32.989.109 2.073-.56 2.87l-.733.873M6.186 28.09l-.734-.874a3.017 3.017 0 0 1-.56-2.87l1.469-4.532a3.03 3.03 0 0 1 2.14-2.005l.89-.225"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeOpacity={0.88}
      d="M3.653 30.062H29.68a.986.986 0 1 0 0-1.972H3.653a.986.986 0 1 0 0 1.972ZM24.111 22.724v3.758M9.222 26.482v-8.244c0-.743.602-1.345 1.345-1.345h12.2c.742 0 1.344.602 1.344 1.345v2.508M19.017 13.849l.277 1.863c.066.438.388.794.817.903l1.098.278M12.124 16.893l1.098-.278c.43-.108.752-.465.817-.903l.278-1.863M7.917 28.09a1.667 1.667 0 0 1-.463-1.154c0-.25.203-.454.454-.454h17.517c.251 0 .454.203.454.454 0 .448-.176.854-.462 1.154"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeOpacity={0.88}
      d="M15.152 21.734a1.515 1.515 0 1 0 3.03 0 1.515 1.515 0 0 0-3.03 0ZM17.44 2h.016a1.6 1.6 0 0 1 1.584 1.606v.025a4.397 4.397 0 0 1-4.398 4.397h-3.84"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeOpacity={0.88}
      d="M18.69 5.354v.285c0 .844.684 1.528 1.528 1.528.45 0 .816.367.814.817l-.01 2.272c0 2.895-3.04 4.512-4.355 4.54-1.316-.028-4.355-1.645-4.355-4.54l-.005-2.227"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeOpacity={0.88}
      d="M10.803 12.693 10.8 7.098A5.093 5.093 0 0 1 15.895 2h1.544a5.093 5.093 0 0 1 5.094 5.098l-.003 9.795M10.803 16.893v-2.219"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeOpacity={0.88}
      d="M21.031 8.028h.697c.444 0 .805.36.805.805v.952c0 .445-.36.805-.806.805h-.72M12.327 10.59h-.72a.806.806 0 0 1-.806-.805v-.952c0-.444.36-.805.805-.805h.7"
    />
  </svg>
);

GirlLaptop.propTypes = {
  size: PropTypes.string,
};

export default GirlLaptop;
