string=""
x=1
j=92000
while [ $x -le 700 ]
do
 string="touch randfile$((j+x)) && git add . && git commit -m '$((j+x)):randfile_$((j+x))'"
 echo $string
 eval "$string"
 x=$[$x+1]
done
echo $push
eval "$push"
