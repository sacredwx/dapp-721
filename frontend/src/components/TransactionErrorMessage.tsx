import React from "react";

interface Props {
  message: string,
  dismiss: () => void,
}

export function TransactionErrorMessage({ message, dismiss }: Props) {
  return (
    <div className="alert alert-danger" role="alert">
      Error sending transaction: {message}
      <button
        type="button"
        className="close"
        data-dismiss="alert"
        aria-label="Close"
        onClick={dismiss}
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );
}
