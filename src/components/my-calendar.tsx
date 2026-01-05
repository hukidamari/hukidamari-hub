const MyCalendar = () => {
  return (
    <iframe
      src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Asia%2FTokyo&showPrint=0&title=%E3%81%B5%E3%81%8D%E3%81%A0%E3%81%BE%E3%82%8A%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC&src=aHVraWRhbWFyaTg4OEBnbWFpbC5jb20&src=amEuamFwYW5lc2UjaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20&color=%23039be5&color=%230b8043"
      style={{
        borderWidth: 0,
        maxWidth: "800px",
        width: "100%",
        height: "600px",
        borderRadius: "8px",
      }}
    ></iframe>
  );
};

export default MyCalendar;
