import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
function IconButton({ iconType, onPress, value, navigate }) {
  const navigateTo = useNavigate();
  const renderIcon = () => {
    switch (iconType) {
      case "pensil":
        return <PencilIcon className="w-5" />;
      case "trash":
        return <TrashIcon className="w-5" />;
      case "filter":
        return <TrashIcon className="w-5" />;
      default:
        return null; // Optionally, you can handle an unknown type
    }
  };

  return (
    <button
      className="btn btn-square btn-ghost p-1"
      onClick={() =>
        navigate ? navigateTo(navigate, { state: value }) : onPress(value)
      }
    >
      {renderIcon()}
    </button>
  );
}

export default IconButton;
