import { useState, useEffect } from "react";
import { UserCircleIcon } from "@heroicons/react/solid";
import { toast } from "react-hot-toast";
import { ethers } from "ethers";
import PrimaryButton from "../components/primary-button";
import Keyboard from "../components/keyboard";
import LoadingIndicator from "../components/loading-indicator";
import addressesEqual from "../utils/addressesEqual";
import TipButton from "../components/tip-button";
import { useMetaMaskAccount } from "../components/meta-mask-account-provider";
import getKeyboardsContract from "../utils/getKeyboardsContract";

export default function Home() {
  const { ethereum, connectedAccount, connectAccount } = useMetaMaskAccount();
  const [keyboards, setKeyboards] = useState([]);
  const [keyboardsLoading, setKeyboardsLoading] = useState(false);

  const keyboardsContract = getKeyboardsContract(ethereum);

  const getKeyboards = async () => {
    if (keyboardsContract && connectedAccount) {
      setKeyboardsLoading(true);
      try {
        const keyboards = await keyboardsContract.getKeyboards();
        console.log("Retrieved keyboards...", keyboards);

        setKeyboards(keyboards);
      } finally {
        setKeyboardsLoading(false);
      }
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => getKeyboards(), [!!keyboardsContract, connectedAccount]);

  const addContractEventHandlers = () => {
    if (keyboardsContract && connectedAccount) {
      keyboardsContract.on("KeyboardCreated", async (keyboard) => {
        if (
          connectedAccount &&
          !addressesEqual(keyboard.owner, connectedAccount)
        ) {
          toast("Somebody created a new keyboard!", {
            id: JSON.stringify(keyboard),
          });
        }
        await getKeyboards();
      });

      keyboardsContract.on("TipSent", (recipient, amount) => {
        if (addressesEqual(recipient, connectedAccount)) {
          toast(
            `You received a tip of ${ethers.utils.formatEther(amount)} eth!`,
            { id: recipient + amount }
          );
        }
      });
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(addContractEventHandlers, [!!keyboardsContract, connectedAccount]);

  if (!ethereum) {
    return <p>Please install MetaMask to connect to this site</p>;
  }

  if (!connectedAccount) {
    return (
      <PrimaryButton onClick={connectAccount}>
        Connect MetaMask Wallet
      </PrimaryButton>
    );
  }

  if (keyboards.length > 0) {
    return (
      <div className="flex flex-col gap-4">
        <PrimaryButton type="link" href="/create">
          Create a Keyboard!
        </PrimaryButton>

        <div className="grid grid-cols-1 gap-2 p-2 md:grid-cols-2">
          {keyboards.map(([kind, isPBT, filter, owner], i) => (
            <div key={i} className="relative">
              <Keyboard kind={kind} isPBT={isPBT} filter={filter} />
              <span className="absolute top-1 right-6">
                {addressesEqual(owner, connectedAccount) ? (
                  <UserCircleIcon className="w-5 h-5 text-indigo-100" />
                ) : (
                  <TipButton keyboardsContract={keyboardsContract} index={i} />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (keyboardsLoading) {
    return (
      <div className="flex flex-col gap-4">
        <PrimaryButton type="link" href="/create">
          Create a Keyboard!
        </PrimaryButton>

        <div className="flex items-center justify-start">
          <LoadingIndicator />
          Loading Keyboards...
        </div>
      </div>
    );
  }

  // No keyboards yet
  return (
    <div className="flex flex-col gap-4">
      <PrimaryButton type="link" href="/create">
        Create a Keyboard!
      </PrimaryButton>
      <p>No keyboards yet!</p>
    </div>
  );
}
