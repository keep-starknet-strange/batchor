import { Box, Text } from "@chakra-ui/react"
import ReadCSV from "../view/ReadCSV"
import UploadCSV from "./UploadCSV"
import { useState } from "react"

export const ContainerCSV = () => {

    const [file, setFile] = useState<File | undefined>()

    return (
        <Box>
            <Text>
                Let's batch your TX with a CSV
            </Text>
            <UploadCSV
                fileParent={file}
                setFile={setFile}

            ></UploadCSV>
            {/* <ReadCSV
            setFile={setFile}
            fileParent={file}
            
            ></ReadCSV> */}
        </Box>
    )
}