import {
  Box,
  Text,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  useColorModeValue,
  ButtonProps,
  useToast,
} from "@chakra-ui/react";
import { useAccount, useProvider } from "@starknet-react/core";
import { CONFIG_WEBSITE } from "../../../constants";
/** @TODO compile and add ABI for ERC721*/
import TokenERC721Abi from "../../../constants/abi/token_erc20.json";
import TokenERC20Abi from "../../../constants/abi/token_erc20.json";
import {
  Call,
  CallData,
  Contract,
  GetTransactionReceiptResponse,
  TransactionStatus,
  cairo,
  shortString,
  uint256,
} from "starknet";
import { useState } from "react";
import GearLoader from "../../loader/GearLoader";
import { ExternalStylizedButtonLink } from "../../button/NavItem";
import { VoyagerExplorerImage } from "../../view/image/VoyagerExplorerImage";
import { BatchType } from "../../../types";
interface IBatchModal {
  modalOpen: boolean;
  chatId?: string;
  onClose: () => void;
  onOpen: () => void;
  restButton?: ButtonProps;
  csvData?: any[];
  verifData?: string;
  isDisabledModal?: boolean;
  isCanTryBatch?: boolean;
  batchType?: BatchType;
  summaryData?: string;
}

const BatchTxModal = ({
  modalOpen,
  chatId,
  onClose,
  onOpen,
  restButton,
  csvData,
  verifData,
  isDisabledModal,
  isCanTryBatch,
  batchType,
  summaryData,
}: IBatchModal) => {
  const color = useColorModeValue("gray.800", "gray.300");
  const bg = useColorModeValue("gray.300", "gray.800");
  const accountStarknet = useAccount();
  const account = accountStarknet.account;
  const address = accountStarknet?.account?.address;
  const [isBatchCanBeSend, setIsBatchCanBeSend] = useState<boolean>(false);
  const [isLoadingTx, setIsLoadingTx] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | undefined>();
  const [txState, setTxState] = useState<
    GetTransactionReceiptResponse | undefined
  >();

  const { provider } = useProvider();
  const toast = useToast();
  const calls: Call[] = [];
  const [callsData, setCallData] = useState<Call[]>([]);

  /** Prepare call transfer
   * Transform:Amount to uint256 with decimals
   */
  const prepareCallTransfer = async (
    contractAddress: string,
    recipient: string,
    amount: number
  ) => {
    try {
      // initialize contract using abi, address and provider
      console.log("contractAddress", contractAddress);
      console.log("recipient", recipient);
      console.log("amount", amount);
      const contract = new Contract(
        TokenERC20Abi.abi,
        contractAddress,
        account
      );
      let decimals = 18;

      try {
        decimals = (await contract.decimals()) ?? 18;
      } catch (e) {
        console.log("decimals can be reach", e);
      }
      console.log("decimals", decimals);
      let amountSent = Number(
        Number(amount) * 10 ** Number(decimals)
      ).toString();
      const myCall: Call = contract.populate("transfer", [
        recipient,
        amountSent,
      ]);
      return myCall;
    } catch (error: any) {
      alert(error.message);
    }
  };

  const prepareNftCallTransfer = async (
    contractAddress: string,
    recipient: string,
    token_id: number
  ) => {
    try {
      // initialize contract using abi, address and provider
      console.log("contractAddress", contractAddress);
      console.log("recipient", recipient);
      console.log("token_id", token_id);

      /** TODO add  */
      const contract = new Contract(
        TokenERC721Abi.abi,
        contractAddress,
        account
      );

      const myCall: Call = contract.populate("transfer", [
        address,// from
        recipient,// from
        token_id, // token_id
      ]);
      return myCall;
    } catch (error: any) {
      console.log("error",error)
      alert(error.message);
      return undefined
    }
  };
  // prepare each call data to transfer amount of token to the recipient
  const prepareTx = async () => {
    try {
      console.log("csvData", csvData);
      if (csvData && csvData?.length == 0) {
        toast({
          title: "Csv data not upload correctly. Please verify your CSV",
          status: "warning",
          isClosable: true
        })
        return;
      }
      csvData?.map(async (row, index) => {
        const tokenAddress = String(row["token_address"]);
        const lenTokenAddress = String(tokenAddress).length;

        const recipient = String(row["recipient"]);
        const lenRecipientAddress = String(recipient).length;
        const amount = String(row["amount"]);
        const token_id = String(row["token_id"]);

        if (cairo.isTypeContractAddress(tokenAddress)) {
          toast({
            title: `Wrong token address in the row number ${index}`,
          });
          return;
        }

        if (cairo.isTypeContractAddress(recipient)) {
          toast({
            title: `Wrong recipient in the row number ${index}`,
          });
          return;
        }

        const contract = new Contract(TokenERC20Abi.abi, tokenAddress, account);
        let decimals = 18;
        let call: Call|undefined;

        if (batchType == BatchType.ERC20) {
          call = await prepareCallTransfer(
            tokenAddress,
            recipient,
            Number(amount)
          );
          decimals = await contract.decimals() ?? 18;
          console.log("call ERC20", call);
        } else if (batchType == BatchType.ERC721) {
          call = await prepareNftCallTransfer(
            tokenAddress,
            recipient,
            Number(token_id)
          );
          console.log("call ERC721", call);
        }
        console.log("call", call);

        if (call) {
          calls.push(call);
        }
        row["decimals"] = decimals;
        return call;
      });

      setCallData(calls);
      setIsBatchCanBeSend(true);

      console.log("calls", calls);
    } catch (e) {
      console.log("Error prepare tx", e)
    }

  };

  const sendTx = async () => {
    let txSend: GetTransactionReceiptResponse | undefined;

    try {
      setIsLoadingTx(true);
      setIsBatchCanBeSend(false);
      console.log("sendTx");

      if (csvData && csvData?.length == 0) {
        toast({
          title: "No data. Wait your transactions to be prepare",
          status: "warning",
        });
        return;
      }

      console.log("calls", calls);
      if (callsData && callsData?.length == 0) {
        toast({
          title: "No calldata. Wait your transactions to be prepare",
          status: "warning",
        });
        return;
      }

      console.log("calls", calls);
      const multicall = await account.execute(callsData);
      setTxHash(multicall?.transaction_hash);
      toast({
        title: "Tx execute. Waiting for confirmation",
        description: `${CONFIG_WEBSITE.page.explorer}/tx/${multicall.transaction_hash}`,
        status: "info",
        isClosable: true,
      });
      let tx = await provider.waitForTransaction(multicall.transaction_hash);
      txSend = tx;
      setTxState(tx);
      console.log("tx", tx.status);
      if (
        tx.status == TransactionStatus.REJECTED ||
        tx.status == TransactionStatus.REVERTED
      ) {
        toast({
          title: `Tx failed. Please verify or contact support`,
          description: `Tx hash= ${multicall.transaction_hash}`,
          status: "error",
        });
      } else if (
        tx.status == TransactionStatus.ACCEPTED_ON_L1 ||
        tx.status == TransactionStatus.ACCEPTED_ON_L2
      ) {
        toast({
          title: `You tx multicall succeed`,
          description: `Tx hash= ${multicall.transaction_hash}`,
        });
      }
      setIsLoadingTx(false);
    } catch (e) {
      console.log("sendTx error", e);
      setIsLoadingTx(false);
      toast({
        title: `Error when sending your tx`,
        status: "error",
      });
    } finally {
      setIsLoadingTx(false);
    }
  };

  const handleClose = () => {
    onClose()
  }
  return (
    <Box>
      <Button
        onClick={onOpen}
        bg={{ base: "brand.primary" }}
        width={"100%"}
        isDisabled={!isCanTryBatch}
        {...restButton}
      >
        Try batch
      </Button>

      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        isOpen={modalOpen}
        onClose={() => onClose}
        // size={"md"}
        size={"lg"}
      >
        <ModalOverlay></ModalOverlay>
        <ModalContent color={color} bg={bg} minH={{ base: "50vh" }}>
          <ModalHeader>Connect to {CONFIG_WEBSITE.title} 👋</ModalHeader>
          <ModalCloseButton onClick={onClose} />
          <ModalBody>
            <Box
              textAlign={"left"}
              display={"grid"}
              width={"100%"}
              gap={{ base: "0.5em" }}
            >
              <Text>Beta of batchor. Please verify before send the tx</Text>

              {isLoadingTx && (
                <Box>
                  <GearLoader></GearLoader>
                </Box>
              )}
              {verifData && <Text>{verifData}</Text>}
              {summaryData && (
                <Text
                  maxW="150px" // Set the maximum width for the text
                  // overflow="hidden" // Hide any overflow content
                  whiteSpace="nowrap" // Prevent text from wrapping to the next line
                  textOverflow="ellipsis" // Show ellipsis (...) for truncated text
                >
                  {summaryData}
                </Text>
              )}

              {txState && (
                <Box>
                  {" "}
                  {(txState?.status == TransactionStatus?.REJECTED ||
                    txState?.status == TransactionStatus?.REVERTED ||
                    txState?.status == TransactionStatus?.NOT_RECEIVED) && (
                      <Text>Tx failed or rejected</Text>
                    )}
                  {txState.status == TransactionStatus?.ACCEPTED_ON_L1 ? (
                    <Text>Accepted TX on L1 .</Text>
                  ) : (
                    txState?.status == TransactionStatus?.ACCEPTED_ON_L2 && (
                      <Text>Tx accepted in L2</Text>
                    )
                  )}
                </Box>
              )}

              {txHash && (
                <Box py={{ base: "1em" }}>
                  <ExternalStylizedButtonLink
                    href={`${CONFIG_WEBSITE.page.explorer}/tx/${txHash}`}
                  >
                    <VoyagerExplorerImage></VoyagerExplorerImage>
                  </ExternalStylizedButtonLink>
                </Box>
              )}

              <Box
                display={"grid"}
                gridTemplateColumns={{ md: "repeat(2,1fr)" }}
                gap={{ base: "0.5em" }}
              >
                <Button onClick={() => prepareTx()}>Prepare batch</Button>
                <Button onClick={() => sendTx()} isDisabled={!isBatchCanBeSend}
                  bg={{ base: "brand.primary" }}
                >
                  Batch tx
                </Button>
              </Box>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BatchTxModal;
