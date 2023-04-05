# ticketing
An app to purchase tickets built using the best practices of microservices.

# Tech stack
nodejs, reactjs, Nextjs, mongodb, kubernetes, nats-streaming-server

# Services
- tickets => handle all the information about tickets. CRUD for a "ticket"
- orders => When ticket is the purchase state. Tracking whether order is complete, cancelled, etc
- payment => Handles the payment for orders
- client => client code written in next js 
- expiration => tracks the whether is order is elligible for payment or expired

All services communication happens with events by nats streaming server
