export default function ImageScroller() {
  return (
    <div className="scroll-container">
      <div className="scroll-content">
        {[...Array(2)].map((_, repeatIndex) =>
          Array.from({ length: 12 }, (_, i) => (
            <div className="scroll-item" key={`${repeatIndex}-${i}`}>
              <img
                src={`/images/product/pic${i + 1}.png`}
                alt={`pic${i + 1}`}
                className="img-fluid"
              />
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .scroll-container {
          overflow: hidden;
          width: 100%;
          box-sizing: border-box;
        }
        .scroll-content {
          display: flex;
          width: calc(150px * 24); /* 12 gambar x 2 duplikat */
          animation: scroll-left 40s linear infinite;
        }
        .scroll-item {
          flex: 0 0 auto;
          width: 150px; /* sesuaikan dengan lebar gambar */
          padding: 0 8px;
          box-sizing: border-box;
        }
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-150px * 12)); /* geser seukuran 12 gambar */
          }
        }
      `}</style>
    </div>
  );
}