package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	ws "github.com/gorilla/websocket"
)

var upgrader = ws.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     allowAllOrigin,
}

var counter = 0

func allowAllOrigin(r *http.Request) bool {
	return true
}

func writeChunk(chunk []byte) {
	err := ioutil.WriteFile(fmt.Sprintf("/tmp/dat_%d", counter), chunk, 0644)
	if err != nil {
		log.Printf("Failed to write chunk")
		return
	}
	counter = counter + 1
}

func handler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Println(err)
		return
	}

	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}

		if messageType == ws.BinaryMessage {
			log.Printf("Chunk received")
			writeChunk(p)
		}
	}

}

func main() {
	fmt.Println("Running server")

	http.HandleFunc("/", handler)
	log.Fatal(http.ListenAndServe(":8001", nil))
}
