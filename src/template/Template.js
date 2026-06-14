import Header from "./Header";
import Content from "./Content";
import Footer from "./Footer";

function Template(props) {
  return (
    <>
      {/* Nhận setCategory và setBrand từ App.js truyền vào rồi đẩy thẳng xuống cho Header */}
      <Header setCategory={props.setCategory} setBrand={props.setBrand} />
      
      {/* Khung chứa nội dung chính của các trang */}
      <Content>{props.children}</Content>
      
      <Footer />
    </>
  );
}

export default Template;