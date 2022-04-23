import { ethers } from "ethers";

import abi from "../utils/Keyboards.json";

const contractAddress = "0xe4944cD011E4D77EbFABa0830b36A7F84bC4a9AE";
const contractABI = abi.abi;

export default function getKeyboardsContract(ethereum) {
  if (ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
  } else {
    return undefined;
  }
}
