// Bosh harf asosidagi ixcham avatar — tashqi rasm xizmatiga bog'liq emas
// (avvalgi placeimg.com o'rniga). Header.js, LeftSidebar.js va profil
// sahifasi shu bittasini ishlatadi.
function Avatar({ email, size = "w-10", textSize = "text-lg", ringClassName = "" }) {
  const initial = (email || "?").charAt(0).toUpperCase();
  return (
    <div className="avatar placeholder">
      <div className={`bg-primary text-primary-content rounded-full ${size} ${ringClassName}`}>
        <span className={textSize}>{initial}</span>
      </div>
    </div>
  );
}

export default Avatar;
