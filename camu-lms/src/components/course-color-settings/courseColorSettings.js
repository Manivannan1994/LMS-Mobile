import { Check } from "react-feather";
import { useState } from "react";
import { hexToRGB } from '../../utils/helper';
import "../../styles/_courseAppearanceStyle.scss";
import { useEffect } from "react";

const CourseClrSettings = (props) => {
    // Color code pallet
    const aClrCode = ["#C7C4C4", "#F06A6A", "#EC8D71", "#F1BD6C", "#F8DF72", "#469B1F", "#5DA283", "#4ECBC4", "#9EE7E3", "#4573D2", "#8D84E8", "#B36BD4", "#F9AAEF", "#F26FB2", "#FC979A", "#6D6E6F"];
    const [bgclr, setBgClr] = useState(props.aprncDtls.orgClr);


    // Refresh the tick state
    useEffect(() => {
        if(props.isAprUpd){
            setBgClr(props.aprncDtls.orgClr);
        }
    },[props.isAprUpd]);

    // Pick the color from pallet
    const pickColorHandler = (vlu) => {
        setBgClr(vlu)
        props.setAprncDtls({ ...props.aprncDtls, bgColor: hexToRGB(vlu), bgClrCode: vlu});
        props.isConfiqBtn(true);
    }

    return (
        <div className="color-pallet-container">
            {aClrCode.map((clr) =>
                <div
                    style={{ backgroundColor: clr }}
                    onClick={() => pickColorHandler(clr)}
                    className="color-pallet"
                    key={clr}
                >
                    {bgclr === clr && <Check style={{ color: "white", width: "16px", height: "16px", display: "block" }} />}
                </div>
            )}
        </div>
    )
}

export default CourseClrSettings;