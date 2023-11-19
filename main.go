package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request){
		fmt.Fprintf(w, "Hello World")
	})

	fmt.Println("listening...")
	http.ListenAndServe("0.0.0.0:3000", nil)
}