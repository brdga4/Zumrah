import "./Card.css";
// Export this component so other files can import it
// Card is the name of our React component
// className = "" means the extra CSS class is optional
// ...props collects additional properties such as id, onClick, and children
export default function Card({ className = "", ...props }) {
    // Return the JSX element that React will render
    return (
        // div is an HTML element used as a container
        // className assigns CSS classes to the div
        // `card ${className}` combines the default "card" class with extra classes
        // {...props} passes all remaining properties to the div
        <div className={`card ${className}`} {...props} />
    );
}   