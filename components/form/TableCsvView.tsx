import React, { useState } from "react";
import {
  Box,
  Table,
  Thead,
  Td,
  Tbody,
  Th,
  Tr,
} from "@chakra-ui/react";
import { BatchType } from "../../types";
import { ERC20_EXPECTED_COLUMNS, ERC721_EXPECTED_COLUMNS, hasExpectedColumns, hasExpectedColumnsERC721 } from "../../utils/csv";
interface ITableViewCsv {
  error?:string;
  batchType:BatchType;
  csvData:any[]
}

const TableCsvView: React.FC<ITableViewCsv> = ({
error,
batchType,
csvData
}: 
ITableViewCsv) => {
 

  return (
    <Box>
    
      <div>
        {error && <p>{error}</p>}
        <Table>
          <Thead>
            <Tr>
              <Th>Token address</Th>
              <Th>{batchType == BatchType.ERC20 ? "Amount" : "Token id"}</Th>
              <Th>Recipient</Th>
            </Tr>
          </Thead>
          <Tbody>
            {csvData &&
              csvData?.length > 0 &&
              csvData?.map((row, index) => {
                if (batchType == BatchType.ERC20) {
                  const tokenAddress = String(row["token_address"]);
                  const lenTokenAddress = String(tokenAddress).length;
                  const recipient = String(row["recipient"]);
                  const lenRecipientAddress = String(recipient).length;
                  const amount = String(row["amount"]);
                  return (
                    <tr key={index}>
                      <Td>
                        {tokenAddress.slice(0, 10)} ...
                        {tokenAddress.slice(
                          lenTokenAddress - 10,
                          lenTokenAddress
                        )}{" "}
                      </Td>
                      <Td>{amount}</Td>
                      <Td>
                        {recipient.slice(0, 10)} ...{" "}
                        {recipient.slice(
                          lenRecipientAddress - 10,
                          lenRecipientAddress
                        )}
                      </Td>
                    </tr>
                  );
                } else if (batchType == BatchType.ERC721) {
                  const tokenAddress = String(row["token_address"]);
                  const lenTokenAddress = String(tokenAddress).length;
                  const recipient = String(row["recipient"]);
                  const lenRecipientAddress = String(recipient).length;
                  const token_id = String(row["token_id"]);
                  return (
                    <tr key={index}>
                      <Td>
                        {tokenAddress.slice(0, 10)} ...
                        {tokenAddress.slice(
                          lenTokenAddress - 10,
                          lenTokenAddress
                        )}{" "}
                      </Td>
                      <Td>{token_id}</Td>
                      <Td>
                        {recipient.slice(0, 10)} ...{" "}
                        {recipient.slice(
                          lenRecipientAddress - 10,
                          lenRecipientAddress
                        )}
                      </Td>
                    </tr>
                  );
                }
              })}
          </Tbody>
        </Table>
      </div>
    </Box>
  );
};

export default TableCsvView;
