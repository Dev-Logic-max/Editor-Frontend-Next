import React, { useId } from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
}

export function DashboardIcon({ width = 32, height = 32, ...rest }: IconProps) {
  return (
    <svg width={width} height={height} {...rest} viewBox="0 0 32 32"><g fill="none"><path fill="url(#SVGoCxCabTV)" d="M12 6.5a3.5 3.5 0 1 1 7 0v19a3.5 3.5 0 1 1-7 0z"></path><path fill="url(#SVGhpY98dzZ)" d="M22 12.5a3.5 3.5 0 1 1 7 0v13a3.5 3.5 0 1 1-7 0z"></path><path fill="url(#SVGwMAFLeYr)" d="M5.5 15A3.5 3.5 0 0 0 2 18.5v7a3.5 3.5 0 1 0 7 0v-7A3.5 3.5 0 0 0 5.5 15"></path><defs><linearGradient id="SVGoCxCabTV" x1={18.417} x2={14.222} y1={24.233} y2={2.819} gradientUnits="userSpaceOnUse"><stop stopColor="#6d37cd"></stop><stop offset={1} stopColor="#ea71ef"></stop></linearGradient><linearGradient id="SVGhpY98dzZ" x1={28.417} x2={25.896} y1={25.333} y2={8.608} gradientUnits="userSpaceOnUse"><stop stopColor="#e23cb4"></stop><stop offset={1} stopColor="#ea71ef"></stop></linearGradient><linearGradient id="SVGwMAFLeYr" x1={2.875} x2={16.259} y1={15.583} y2={23.499} gradientUnits="userSpaceOnUse"><stop stopColor="#36dff1"></stop><stop offset={1} stopColor="#0078d4"></stop></linearGradient></defs></g></svg>
  );
}

export function FileIcon({ width = 32, height = 32, ...rest }: IconProps) {
  return (
    <svg width={width} height={height} {...rest} viewBox="0 0 32 32"><g fill="none"><path fill="#b4acbc" d="M4.5 1A2.5 2.5 0 0 0 2 3.5v23A2.5 2.5 0 0 0 4.5 29H7v.5A1.5 1.5 0 0 0 8.5 31h17a1.5 1.5 0 0 0 1.5-1.5v-23A1.5 1.5 0 0 0 25.5 5h-4.586l-3.268-3.268A2.5 2.5 0 0 0 15.88 1z" /><path fill="#f3eef8" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h11.379a1.5 1.5 0 0 1 1.06.44l5.622 5.62A1.5 1.5 0 0 1 23 9.122V26.5a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 3 26.5z" /><path fill="#998ea4" d="M6.5 11a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1zM6 17.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1z" /><path fill="#cdc4d6" d="M16 2.005a1.5 1.5 0 0 1 .94.434l5.62 5.622a1.5 1.5 0 0 1 .435.939H17.5A1.5 1.5 0 0 1 16 7.5z" /><path fill="#f70a8d" d="M22.36 13.118a.5.5 0 0 1 .323-.118H25.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2.817a.5.5 0 0 1-.322-.118l-1.187-1a.5.5 0 0 1 0-.764z" /><path fill="#f9c23c" d="M25.36 20.118a.5.5 0 0 1 .323-.118H28.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2.817a.5.5 0 0 1-.322-.118l-1.187-1a.5.5 0 0 1 0-.764z" /></g></svg>
  )
}

export function UsersIcon({ width = 32, height = 32, ...rest }: IconProps) {
  const id = useId(); // ensures unique gradient IDs
  const uid = (suffix: string) => `${suffix}-${id}`;

  return (
    <svg width={width} height={height} viewBox="0 0 28 28" {...rest}> <g fill="none"><path fill={`url(#${uid("SVGmDMJEVPN")})`} d="M21.5 23a4.5 4.5 0 0 1-4.5-4.501V12.75c0-.966.784-1.75 1.75-1.75h5.5c.966 0 1.75.784 1.75 1.75v5.75a4.5 4.5 0 0 1-4.5 4.5" /><path fill={`url(#${uid("SVGRJv8Tb7x")})`} fillOpacity="0.5" d="M21.5 23a4.5 4.5 0 0 1-4.5-4.501V12.75c0-.966.784-1.75 1.75-1.75h5.5c.966 0 1.75.784 1.75 1.75v5.75a4.5 4.5 0 0 1-4.5 4.5" /><path fill={`url(#${uid("SVGaSOdzcRa")})`} d="M6.5 23A4.5 4.5 0 0 1 2 18.499V12.75c0-.966.784-1.75 1.75-1.75h5.5c.966 0 1.75.784 1.75 1.75v5.75A4.5 4.5 0 0 1 6.5 23" /><path fill={`url(#${uid("SVGGrJArbmj")})`} fillOpacity="0.5" d="M6.5 23A4.5 4.5 0 0 1 2 18.499V12.75c0-.966.784-1.75 1.75-1.75h5.5c.966 0 1.75.784 1.75 1.75v5.75A4.5 4.5 0 0 1 6.5 23" /><path fill={`url(#${uid("SVGvnnMrb1w")})`} d="M17.754 11c.966 0 1.75.784 1.75 1.75v6.749a5.501 5.501 0 0 1-11.002 0V12.75c0-.966.783-1.75 1.75-1.75z" /><path fill={`url(#${uid("SVGbyOmMcMs")})`} d="M17.754 11c.966 0 1.75.784 1.75 1.75v6.749a5.501 5.501 0 0 1-11.002 0V12.75c0-.966.783-1.75 1.75-1.75z" /><path fill={`url(#${uid("SVGHQjGzcPc")})`} d="M22.003 4a3 3 0 1 1 0 6a3 3 0 0 1 0-6" /><path fill={`url(#${uid("SVGJGpOddcD")})`} d="M5.997 4a3 3 0 1 1 0 6a3 3 0 0 1 0-6" /><path fill={`url(#${uid("SVGez6dqljK")})`} d="M14 3a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7" /><defs><linearGradient id={uid("SVGmDMJEVPN")} x1="19.14" x2="25.829" y1="12.595" y2="20.605" gradientUnits="userSpaceOnUse"> <stop offset=".125" stopColor="#7a41dc" /><stop offset="1" stopColor="#5b2ab5" /></linearGradient><linearGradient id={uid("SVGaSOdzcRa")} x1="4.14" x2="10.829" y1="12.595" y2="20.605" gradientUnits="userSpaceOnUse"> <stop offset=".125" stopColor="#9c6cfe" /><stop offset="1" stopColor="#7a41dc" /></linearGradient><linearGradient id={uid("SVGvnnMrb1w")} x1="11.118" x2="18.849" y1="12.861" y2="22.562" gradientUnits="userSpaceOnUse"> <stop offset=".125" stopColor="#bd96ff" /> <stop offset="1" stopColor="#9c6cfe" /></linearGradient><linearGradient id={uid("SVGbyOmMcMs")} x1="14.003" x2="25.802" y1="9.333" y2="26.659" gradientUnits="userSpaceOnUse"> <stop stopColor="#885edb" stopOpacity="0" /> <stop offset="1" stopColor="#e362f8" /></linearGradient><linearGradient id={uid("SVGHQjGzcPc")} x1="20.43" x2="23.488" y1="4.798" y2="9.68" gradientUnits="userSpaceOnUse"> <stop offset=".125" stopColor="#7a41dc" /> <stop offset="1" stopColor="#5b2ab5" /></linearGradient><linearGradient id={uid("SVGJGpOddcD")} x1="4.424" x2="7.482" y1="4.798" y2="9.68" gradientUnits="userSpaceOnUse"> <stop offset=".125" stopColor="#9c6cfe" /> <stop offset="1" stopColor="#7a41dc" /></linearGradient><linearGradient id={uid("SVGez6dqljK")} x1="12.165" x2="15.732" y1="3.931" y2="9.627" gradientUnits="userSpaceOnUse"> <stop offset=".125" stopColor="#bd96ff" /> <stop offset="1" stopColor="#9c6cfe" /></linearGradient><radialGradient id={uid("SVGRJv8Tb7x")} cx="0" cy="0" r="1" gradientTransform="matrix(7.24251 0 0 16.3823 15.586 16.719)" gradientUnits="userSpaceOnUse"> <stop offset=".433" stopColor="#3b148a" /> <stop offset="1" stopColor="#3b148a" stopOpacity="0" /></radialGradient><radialGradient id={uid("SVGGrJArbmj")} cx="0" cy="0" r="1" gradientTransform="matrix(-8.01505 0 0 -18.1297 13.915 16.719)" gradientUnits="userSpaceOnUse"> <stop offset=".433" stopColor="#3b148a" /> <stop offset="1" stopColor="#3b148a" stopOpacity="0" /></radialGradient></defs></g></svg>
  );
}

export function SettingsIcon({ width = 32, height = 32, ...rest }: IconProps) {
  const id = useId();
  const uid = (suffix: string) => `${suffix}-${id}`;

  return (
    <svg width={width} height={height} viewBox="0 0 48 48" fill="none" {...rest}> <g fill="none"><path fill={`url(#${uid('SVG9RdIpd1U')})`} d="M19.494 43.468c1.479.353 2.993.531 4.513.531a19.4 19.4 0 0 0 4.503-.534a1.94 1.94 0 0 0 1.474-1.672l.338-3.071a2.32 2.32 0 0 1 2.183-2.075c.367-.016.732.053 1.068.2l2.807 1.231a1.92 1.92 0 0 0 1.554.01c.247-.105.468-.261.65-.458a20.4 20.4 0 0 0 4.51-7.779a1.94 1.94 0 0 0-.7-2.133l-2.494-1.84a2.326 2.326 0 0 1 0-3.764l2.486-1.836a1.94 1.94 0 0 0 .7-2.138a20.3 20.3 0 0 0-4.515-7.777a1.94 1.94 0 0 0-2.192-.45l-2.806 1.236c-.29.131-.606.2-.926.2a2.34 2.34 0 0 1-2.32-2.088l-.34-3.06a1.94 1.94 0 0 0-1.5-1.681a21.7 21.7 0 0 0-4.469-.519a22 22 0 0 0-4.5.52a1.935 1.935 0 0 0-1.5 1.677l-.34 3.062a2.35 2.35 0 0 1-.768 1.488a2.53 2.53 0 0 1-1.569.6a2.3 2.3 0 0 1-.923-.194l-2.8-1.236a1.94 1.94 0 0 0-2.2.452a20.35 20.35 0 0 0-4.51 7.775a1.94 1.94 0 0 0 .7 2.137l2.488 1.836a2.344 2.344 0 0 1 .701 2.938a2.34 2.34 0 0 1-.7.829l-2.49 1.839a1.94 1.94 0 0 0-.7 2.135a20.3 20.3 0 0 0 4.51 7.782a1.93 1.93 0 0 0 2.193.454l2.818-1.237c.291-.128.605-.194.923-.194h.008a2.34 2.34 0 0 1 2.32 2.074l.338 3.057a1.94 1.94 0 0 0 1.477 1.673M24 30.25a6.25 6.25 0 1 1 0-12.5a6.25 6.25 0 0 1 0 12.5" /> <defs> <linearGradient id={uid('SVG9RdIpd1U')} x1="33.588" x2="11.226" y1="42.451" y2="7.607" gradientUnits="userSpaceOnUse"><stop stopColor="#70777d" /> <stop offset="1" stopColor="#b9c0c7" /> </linearGradient> </defs></g></svg>
  );
}


export function DocumentIcon({ width = 32, height = 32, ...rest }: IconProps) {
  const id = useId();
  const uid = (suffix: string) => `${suffix}-${id}`;

  return (
    <svg width={width} height={height} viewBox="0 0 32 32" {...rest}> <g fill="none"><path fill={`url(#${uid("SVGRYJ6vbiV")})`} d="M17 2H8a3 3 0 0 0-3 3v22a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V12l-7-3z" /><path fill={`url(#${uid("SVGNuJ7pdcP")})`} fillOpacity={0.5} d="M17 2H8a3 3 0 0 0-3 3v22a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V12l-7-3z" /><path fill={`url(#${uid("SVGqtO3jXrP")})`} d="M17 10V2l10 10h-8a2 2 0 0 1-2-2" /><path fill={`url(#${uid("SVGX7kGspAP")})`} fillOpacity={0.9} d="M11 23a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2zm-1-3a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H11a1 1 0 0 1-1-1m1-5a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2z" /><defs><linearGradient id={uid("SVGRYJ6vbiV")} x1={20.4} x2={22.711} y1={2} y2={25.61} gradientUnits="userSpaceOnUse"><stop stopColor="#6ce0ff" /><stop offset={1} stopColor="#4894fe" /></linearGradient>  <linearGradient id={uid("SVGqtO3jXrP")} x1={21.983} x2={19.483} y1={6.167} y2={10.333} gradientUnits="userSpaceOnUse"><stop stopColor="#9ff0f9" /><stop offset={1} stopColor="#b3e0ff" /></linearGradient>  <linearGradient id={uid("SVGX7kGspAP")} x1={22} x2={11.105} y1={29} y2={10.354} gradientUnits="userSpaceOnUse"> <stop stopColor="#9deaff" /> <stop offset={1} stopColor="#fff" /></linearGradient> <radialGradient id={uid("SVGNuJ7pdcP")} cx={0} cy={0} r={1} gradientTransform="rotate(133.108 13.335 7.491)scale(17.438 10.2853)" gradientUnits="userSpaceOnUse"><stop offset={0.362} stopColor="#4a43cb" /><stop offset={1} stopColor="#4a43cb" stopOpacity={0} /></radialGradient></defs></g></svg>
  );
}

export function FolderIcon({ width = 32, height = 32, ...rest }: IconProps) {
  const id = useId();
  const uid = (suffix: string) => `${suffix}-${id}`;

  return (
    <svg width={width} height={height} {...rest} viewBox="0 0 24 24"><g fill="none"><path fill="url(#SVGPrmugbjO)" d="M8 6.25A2.25 2.25 0 0 1 10.25 4h7.5A2.25 2.25 0 0 1 20 6.25v8.5A2.25 2.25 0 0 1 17.75 17h-7.5A2.25 2.25 0 0 1 8 14.75z"/><path fill="url(#SVGdBuGNmjL)" d="M8 6.25A2.25 2.25 0 0 1 10.25 4h7.5A2.25 2.25 0 0 1 20 6.25v8.5A2.25 2.25 0 0 1 17.75 17h-7.5A2.25 2.25 0 0 1 8 14.75z"/><path fill="url(#SVGDSS2BeGC)" d="M4 4.25A2.25 2.25 0 0 1 6.25 2h9a2.25 2.25 0 0 1 2.25 2.25v10.5A2.25 2.25 0 0 1 15.25 17h-9A2.25 2.25 0 0 1 4 14.75z"/><path fill="url(#SVGl7J9xcou)" d="M5.25 8A2.25 2.25 0 0 0 3 10.25v8.5A3.25 3.25 0 0 0 6.25 22h11.5A3.25 3.25 0 0 0 21 18.75v-1.5A2.25 2.25 0 0 0 18.75 15h-2.846a.75.75 0 0 1-.55-.24l-5.61-6.04A2.25 2.25 0 0 0 8.097 8z"/><defs><linearGradient id="SVGPrmugbjO" x1="21.8" x2="23.639" y1="19.5" y2="5.773" gradientUnits="userSpaceOnUse"><stop stopColor="#bb45ea"/><stop offset="1" stopColor="#9c6cfe"/></linearGradient><linearGradient id="SVGdBuGNmjL" x1="20" x2="17" y1="8.5" y2="8.5" gradientUnits="userSpaceOnUse"><stop offset=".338" stopColor="#5750e2" stopOpacity="0"/><stop offset="1" stopColor="#5750e2"/></linearGradient><linearGradient id="SVGl7J9xcou" x1="6.857" x2="6.857" y1="8" y2="27.091" gradientUnits="userSpaceOnUse"><stop offset=".241" stopColor="#ffd638"/><stop offset=".637" stopColor="#fab500"/><stop offset=".985" stopColor="#ca6407"/></linearGradient><radialGradient id="SVGDSS2BeGC" cx="0" cy="0" r="1" gradientTransform="matrix(8.775 -11.5 18.53666 14.14428 8.05 14)" gradientUnits="userSpaceOnUse"><stop offset=".228" stopColor="#2764e7"/><stop offset=".685" stopColor="#5cd1ff"/><stop offset="1" stopColor="#6ce0ff"/></radialGradient></defs></g></svg>
  );
}

export function TemplateIcon({ width = 32, height = 32, ...rest }: IconProps) {
  const id = useId();
  const uid = (suffix: string) => `${suffix}-${id}`;

  return (
    <svg width={width} height={height} {...rest} viewBox="0 0 28 28"><g fill="none"><path fill="url(#SVGD6KEPcZX)" d="M6.75 3A3.75 3.75 0 0 0 3 6.75v14.5A3.75 3.75 0 0 0 6.75 25h14.5A3.75 3.75 0 0 0 25 21.25V6.75A3.75 3.75 0 0 0 21.25 3z"/><path fill="url(#SVGyL9bGdbi)" d="M6 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zm0 6.75a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75m.75 3a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5zm8.75-2.5c0-.966.784-1.75 1.75-1.75h3c.966 0 1.75.784 1.75 1.75v3A1.75 1.75 0 0 1 20.25 21h-3a1.75 1.75 0 0 1-1.75-1.75z"/><defs><linearGradient id="SVGD6KEPcZX" x1="10.857" x2="19.286" y1="3" y2="23.814" gradientUnits="userSpaceOnUse"><stop stopColor="#b3e0ff"/><stop offset="1" stopColor="#8cd0ff"/></linearGradient><linearGradient id="SVGyL9bGdbi" x1="6" x2="24.628" y1="7" y2="14.235" gradientUnits="userSpaceOnUse"><stop stopColor="#0094f0"/><stop offset="1" stopColor="#2764e7"/></linearGradient></defs></g></svg>
  );
}