import { useNavigate } from "react-router-dom";
function Button({ value, btnStyle, name, containerStyle, onPress, navigate,  }) {
  const navigateTo = useNavigate();
  return (
    <div className={`inline-block float-right ${containerStyle}`}>
      <button
        className={`btn mx-1 ${btnStyle}`}
        onClick={() => (navigate ? navigateTo(navigate) : onPress(value))}
      >
        {name}
      </button>
    </div>
  );
}

export default Button;
