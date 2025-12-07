import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<HTMLImageElement>) {
    return (
        <img {...props} src="/logonew.png" alt="Rafco Logo" style={{ width: '200px' }} />
    );
}
