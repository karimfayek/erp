import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<HTMLImageElement>) {
    return (
        <img {...props} src="/logo.png" alt="Rafco Logo" style={{ width: '200px' }} />
    );
}
