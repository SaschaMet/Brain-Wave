export default function Navbar() {
    return (
        <header className="p-3 mb-3 border-bottom" >
            <div className="container-xl">
                <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                    <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
                        <li><a href="/" className="nav-link px-2 link-body-emphasis">Home</a></li>
                        <li><a href="/edit" className="nav-link px-2 link-body-emphasis">Edit Questions</a></li>
                        <li><a href="/statistics" className="nav-link px-2 link-body-emphasis">Statistics</a></li>
                    </ul>

                    <div className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3">
                        <a href="/insert" type="button" className="btn btn-info">Add New Question</a>
                    </div>


                </div>
            </div>
        </header>
    )
}