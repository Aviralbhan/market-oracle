import { QRCodeSVG } from "qrcode.react";

export function QRCodeBlock({ roomCode }: { roomCode: string }) {
  const joinUrl = `${window.location.origin}/join/${roomCode}`;

  return (
    <div className="qr-block">
      <QRCodeSVG value={joinUrl} size={168} bgColor="transparent" fgColor="currentColor" />
      <p className="qr-url">{joinUrl}</p>
    </div>
  );
}
