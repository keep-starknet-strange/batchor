import { Account, AccountInterface, Call, Contract, RpcProvider } from "starknet";
import TokenERC721Abi from "../constants/abi/erc721_token.json";
import TokenERC20Abi from "../constants/abi/token_erc20.json";
/** Prepare call transfer
 * Transform:Amount to uint256 with decimals
 */
export const prepareCallTransfer = async (
  contractAddress: string,
  recipient: string,
  amount: number,
  account: AccountInterface
) => {
  try {
    // initialize contract using abi, address and provider
    const contract = new Contract(TokenERC20Abi.abi, contractAddress, account);
    let decimals = 18;

    try {
      decimals = (await contract.decimals()) ?? 18;
    } catch (e) {
      console.log("decimals can be reach", e);
    }
    console.log("decimals", decimals);
    let amountSent = Number(Number(amount) * 10 ** Number(decimals)).toString();
    const myCall: Call = contract.populate("transfer", [recipient, amountSent]);
    return myCall;
  } catch (error: any) {
    alert(error.message);
  }
};

export const prepareNftCallTransfer = async (
  contractAddress: string,
  recipient: string,
  token_id: number,
  account: AccountInterface
) => {
  try {
    // initialize contract using abi, address and provider
    const contract = new Contract(TokenERC721Abi.abi, contractAddress, account);

    const call: Call = contract.populate("transfer_from", [
      account?.address,
      recipient,
      token_id,
    ]);
    return call;
  } catch (error) {
    console.log("error", error);
    alert(error.message);
    return undefined;
  }
};
