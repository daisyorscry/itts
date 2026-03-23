"use client";

import * as React from "react";
import { MinusIcon } from "lucide-react";

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

export { InputOTPSeparator };
