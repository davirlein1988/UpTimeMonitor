a = [1,2,3,4,5,6]
en [1, 4, 9, 16, 25, 36]


a.map do |e|
	a = e
	e = a + e

end