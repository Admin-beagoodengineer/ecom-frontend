import '../styles/footer.scss'


const Footer = () => {
  return (
    <div className="home-footer">
      <div>
        <h3>Refund Policy</h3>
        <a href="/refundPolicy.pdf" target="_blank">
          <img src="/download.png" alt="Download" />
        </a>
      </div>
      <div>
        <h3>Contact Us</h3>
        <a href="/contactUs.pdf" target="_blank">
          <img src="/download.png" alt="Download" />
        </a>
      </div>
      <div>
        <h3>FSSAI License</h3>
        <a href="/6FSSAI License.pdf" target="_blank">
          <img src="/download.png" alt="Download" />
        </a>
      </div>
      <div>
        <h3>Terms and Conditions</h3>
        <a href="/tnc.pdf" target="_blank">
          <img src="/download.png" alt="Download" />
        </a>
      </div>
    </div>
  );
};

export default Footer;
