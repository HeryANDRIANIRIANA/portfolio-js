class Card extends HTMLElement{
    constructor(opt={}){
        const{
            headerContent="header",
            bodyContent="body",
            footerContent="footer",
        }=opt
        super()
        this.attachShadow({mode:'open'})
        this.headerContent=headerContent
        this.bodyContent=bodyContent
        this.footerContent=footerContent
        this.render()
    }
    render(){
        console.log(this.footerContent);
        this.shadowRoot.innerHTML=`
        <style>
                /* Styles internes pour la Card - Isolés par le Shadow DOM */
                .card {
                    /* Base du look Bootstrap Card */
                    border: 1px solid #dee2e6;
                    border-radius: 0.375rem; /* Rayon par défaut de Bootstrap 5 */
                    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
                    margin-bottom: 1.5rem; /* Marge classique */
                    background-color: #fff;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    word-wrap: break-word;
                }

                /* En-tête de la Card */
                .card-header {
                    padding: 0.75rem 1rem;
                    margin-bottom: 0;
                    background-color: #f8f9fa; /* Couleur d'en-tête */
                    border-bottom: 1px solid #dee2e6;
                    border-top-left-radius: calc(0.375rem - 1px);
                    border-top-right-radius: calc(0.375rem - 1px);
                }

                /* Corps du contenu principal */
                .card-body {
                    flex: 1 1 auto;
                    padding: 1rem 1rem;
                }

                /* Pied de page de la Card */
                .card-footer {
                    padding: 0.5rem 1rem;
                    background-color: #f8f9fa; /* Couleur de pied de page */
                    border-top: 1px solid #dee2e6;
                    border-bottom-left-radius: calc(0.375rem - 1px);
                    border-bottom-right-radius: calc(0.375rem - 1px);
                }
            </style>

        
        <div class="card">
        <div class="card-header">${this.headerContent} </div>
        <div class="card-body">${this.bodyContent} </div>
        <div class="card-footer">${this.footerContent} </div>
        
        </div>
        `
    }
}

customElements.define('my-card', Card)