const db = require('../../models')
const vendor_service_review = db.vendor_service_review
const Customer = db.Customer

exports.getAllReviews = async(req, res, next) => {
    try{
        const id = req.user.id;
        const rating_and_reviews = await vendor_service_review.findAll({
            where: {
                vendor: id
            },
            attributes: ['id', 'time', 'rating', 'comment'],
            include: [
                {
                    model: Customer,
                    attributes: ['id', 'firstname', 'middlename', 'lastname', 'profile_img']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        if(!rating_and_reviews){
            return res.status(404).json({status: false, message: "No rating and reviews found."})
        }

        const data = rating_and_reviews.map((item)=>{
            return {
            rating_and_review_id: item.id,
            time: item.time,
            review: item.comment,
            rating: item.rating,
            customer_id: item.Customer.id,
            customer_firstname: item.Customer.firstname,
            customer_middlename: item.Customer.middlename,
            customer_lastname: item.Customer.lastname,
            customer_profile: item.Customer.profile_img
            }
        })
        return res.status(200).json({status: true, message: "Successful", data: data})
    }catch(err){    
        next(err);
    }
}

exports.getAllFeedback = async(req, res, next) => {
   try {
  const id = req.user.id
  const rating_and_reviews = await vendor_service_review.findAll({
    where: {
      vendor: id
    },
    attributes: ['id', 'time', 'comment'],
    include: [
      {
        model: Customer,
        attributes: ['id', 'firstname', 'middlename', 'lastname']
      }
    ]
  })

  if (!rating_and_reviews) {
    return res
      .status(404)
      .json({ status: false, message: 'No rating and reviews found.' })
  }

  const data = rating_and_reviews.map(item => {
    return {
      rating_and_review_id: item.id,
      time: item.time,
      review: item.comment,
      customer_id: item.Customer.id,
      customer_firstname: item.Customer.firstname,
      customer_middlename: item.Customer.middlename,
      customer_lastname: item.Customer.lastname
    }
  })
  return res
    .status(200)
    .json({ status: true, message: 'Successful', data: data })
} catch (err) {
  next(err)
}
}