declare module '*.svg' {
  import React from 'react';
  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}

declare module '*.svg?react' {
  import React from 'react';
  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
