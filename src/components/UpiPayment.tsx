
import { QrCode, Scan } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

const UpiPayment = () => {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center space-x-2">
        <QrCode className="text-primary h-6 w-6" />
        <h2 className="text-2xl font-semibold">Pay with UPI</h2>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <img
          src="/qr-code.png"
          alt="UPI QR Code"
          className="w-44 h-44 rounded-md"
        />
        </div>
        <p className="text-sm text-gray-600">Scan QR code to pay via UPI</p>
        <Button variant="outline" className="w-full">
          Download QR Code
        </Button>
      </div>
    </Card>
  );
};

export default UpiPayment;
