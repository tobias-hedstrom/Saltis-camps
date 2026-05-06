import { useAppData } from "../hooks/useAppData";
import { exportBoardCsv } from "../utils/exportUtils";

export default function ExportButton() {
  const { camps, registrations } = useAppData();

  function handleClick() {
    exportBoardCsv(camps, registrations);
  }

  return (
    <button className="btn btn-export" onClick={handleClick}>
      ⬇ Download Board Excel (CSV)
    </button>
  );
}
